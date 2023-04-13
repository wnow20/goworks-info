
# Java中使用Playwright实现端到端测试

## Playwright介绍
Playwright 是专门为满足端到端测试的需要而创建的。 Playwright 支持所有现代渲染引擎，包括 Chromium、WebKit 和 Firefox。 在 Windows、Linux 和 macOS 上，在本地或在 CI 上，在无头或有头的移动终端仿真进行测试。

到目前为止 Playwright 支持 Java、Node.js、Python、.NET四大主流语言，Java生态 Playwright 非常简洁的提供一个 [Maven](https://maven.apache.org/what-is-maven.html) 模块即可工作。 使用它的最简单方法是向项目的 pom.xml 添加一个依赖项，如下所述。 如果您不熟悉 Maven，请参阅其[文档](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html)。

本文将以Java 单元测试的形式介绍如何通过 Playwright 完成网站的E2E框架测试。 

比如你对 Playwright 还不熟悉，请访问 [Playwright使用引导](./playwright-guide.md) 快速入门，了解其 [Auto-Waiting]、[Locator]等概念

## 配置Playwright单元测试上下文

```java
@TestInstance(Lifecycle.PER_CLASS)
public class TodoE2ETest {
    static Playwright playwright;
    static Browser browser;

    // 为每个测试方法生成上下文
    BrowserContext context;
    Page page;
    
    @BeforeAll
    static void launchBrowser() throws InterruptedException {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
            new LaunchOptions()
                .setHeadless(true)
                .setSlowMo(10)
        );
    }

    @AfterAll
    static void closeBrowser() {
        playwright.close();
    }

    @BeforeEach
    void createContextAndPage() {
        context = browser.newContext();
        page = context.newPage();
    }

    @AfterEach
    void closeContext() {
        context.close();
    }
    
    // ...单元测试
}
```

Playwright Java is not thread safe, i.e. all its methods as well as methods on all objects created by it (such as BrowserContext, Browser, Page etc.) are expected to be called on the same thread where the Playwright object was created or proper synchronization should be implemented to ensure only one thread calls Playwright methods at any given time. Having said that it's okay to create multiple Playwright instances each on its own thread.

Here is an example where three playwright instances are created each on its own thread. Each instance launches its own browser process and runs the test against it.


**代码解释**
1. Playwright Java包是非现场安全的，它的所有方法需要运行在同一线程中同步执行。因此需要为每个测试用例创建各自的 [BrowserContext] 和 [Page] 对象；
2. 在 `@BeforeAll` 创建 `playwright`、`browser`对象，启动浏览器，默认使用无头模式，另外，在本地调试时，可以改为UI模式，并在 `@AfterAll` 中销毁；
3. 在 `@BeforeEach` 中为每个测试用例创建各自的 [BrowserContext] 和 [Page] 对象，并在 `@AfterEach` 中销毁；

## 启动测试目标web服务
本文的意图是要启动一个代办应用的 nodejs 服务，并测试其UI功能，因此我们需要再测试中启用node的web服务，该web服务克隆自 http://todomvc.com/

```java
// 单元测试线程存储目标web服务的子线程引用
static ThreadLocal<Thread> threadLocal = new ThreadLocal<>();

@BeforeAll
static void launchBrowser() throws InterruptedException {
    // 用于等待web服务启用完成
    CountDownLatch latch = new CountDownLatch(1);

    Thread thread = new Thread(() -> {
        try {
            String path = currentPath();
            Path todoAppPath = Paths.get(path).resolve("../../todo-app").normalize();
            Process exec = new ProcessBuilder()
                .directory(todoAppPath.toFile())
                .command("npm", "start")
                .start();
            // 在线程结束时，需要终止web应用
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("destroy todo app");
                exec.destroy();
            }));
            BufferedReader in = new BufferedReader(new
                InputStreamReader(exec.getInputStream()));
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                System.out.println(inputLine);
                if (inputLine.startsWith("Serving on")) {
                    latch.countDown();
                }
            }
            in.close();
        } catch (IOException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
        }
    });
    thread.start();
    threadLocal.set(thread);
    latch.await();
}

@AfterEach
void tearDown() {
    // 测试结束过，终止子线程
    Thread thread = threadLocal.get();
    if (thread != null) {
        thread.interrupt();
    }
}
```

**代码解释**
1. 命令行启动web应用，由于web应用执行是持续执行的，因此在Java单元测试中需要通过子线程运行，避免阻断主线程；
2. 使用 `CountDownLatch` 用于判断web应用是否启动完毕；
3. 测试结束过，终止子线程
4. 在线程结束时，需要终止web应用，这里使用 `addShutdownHook`实现；

## 使用Playwright编写测试用例
一共6个用例，分别是创建代办、完成代办、删除代办、切换tab等

```java
@Test
void test_add_todo_item() {
    String todoItemName = "new test todo for e2e";
    new TodoApp(browser, "http://localhost:4200/")
        .createTodo(todoItemName);
}

@Test
void test_check_todo_item() {
    String todoItemName = "new test todo for e2e";
    new TodoApp(browser, "http://localhost:4200/")
        .createTodo(todoItemName)
        .checkTodo(todoItemName);
}

@Test
void test_remove_todo_item() {
    String todoItemName = "new test todo for e2e";
    new TodoApp(browser, "http://localhost:4200/")
        .createTodo(todoItemName)
        .removeTodo(todoItemName);
}

@Test
void test_switch_tabs() {
    String todoItemName = "switchTab";
    TodoApp todoApp = new TodoApp(browser, "http://localhost:4200/")
        .createTodo(todoItemName + 1)
        .checkTodo(todoItemName + 1)
        .createTodo(todoItemName + 2)
        .removeTodo(todoItemName + 2)
        .createTodo(todoItemName + 3);

    Locator todosLocator = todoApp.switchCompleted()
        .locator(".todo-list li");
    assertThat(todosLocator).hasCount(1);
    assertThat(todosLocator.locator("text=" + todoItemName + 1)).hasCount(1);

    todosLocator = todoApp.switchActive()
        .locator(".todo-list li");
    assertThat(todosLocator).hasCount(1);
    assertThat(todosLocator.locator("text=" + todoItemName + 3)).hasCount(1);
}

@Test
void test_clean_completed() {
    String todoItemName = "switchTab";
    TodoApp todoApp = new TodoApp(browser, "http://localhost:4200/")
        .createTodo(todoItemName + 1)
        .checkTodo(todoItemName + 1)
        .createTodo(todoItemName + 2);

    todoApp.locator("button.clear-completed").click();
    assertThat(todoApp.locator("text=" + todoItemName + 1)).hasCount(0);
    assertThat(todoApp.locator("text=" + todoItemName + 2)).hasCount(1);
}

@Test
void test_work_fine_with_location_hash() {
    String todoItemName = "switchTab";
    TodoApp todoApp = new TodoApp(browser, "http://localhost:4200/")
        .createTodo(todoItemName + 1)
        .checkTodo(todoItemName + 1)
        .createTodo(todoItemName + 2);

    todoApp.page().navigate("http://localhost:4200/#/active");

    assertThat(todoApp.locator(".filters a[href=\"#/active\"]")).hasClass("selected");
    assertThat(todoApp.locator("text=" + todoItemName + 1)).hasCount(0);
    assertThat(todoApp.locator("text=" + todoItemName + 2)).hasCount(1);
}
```

## 并发运行测试
默认情况下，JUnit 将在单个线程上按顺序运行所有测试。 从 JUnit 5.3 开始，您可以更改此行为以并行运行测试以加快执行速度（请参阅[此页面](https://junit.org/junit5/docs/snapshot/user-guide/index.html#writing-tests-parallel-execution)）。 由于在没有额外同步的情况下从多个线程使用相同的 Playwright 对象是不安全的，我们建议您为每个线程创建 Playwright 实例并在该线程上独占使用它。 这是一个如何并行运行多个测试类的示例。

使用 [`@TestInstance(TestInstance.Lifecycle.PER_CLASS)`](https://junit.org/junit5/docs/current/api/org.junit.jupiter.api/org/junit/jupiter/api/TestInstance.html) 注释使 JUnit 为该类中的所有测试方法创建该类的一个实例（默认情况下，每个 JUnit 将为每个测试方法创建该类的一个新实例）。 在实例字段中存储 [Playwright](https://playwright.dev/java/docs/api/class-playwright) 和 [Browser](https://playwright.dev/java/docs/api/class-browser) 对象。 它们将在测试之间共享。 该类的每个实例都将使用它自己的 Playwright 副本。

配置 JUnit 以按顺序在每个类中运行测试并在并行线程上运行多个类（最大线程数等于 CPU 内核数的 1/2）：

:::: code-group
::: code-group-item junit-platform.properties
```properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = same_thread
junit.jupiter.execution.parallel.mode.classes.default = concurrent
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=0.5
```
:::
::::

## 总结
通过Playwright Java很好的解决了E2E测试问题，它是一个非常良好的框架。本文涉及到的完整代码请访问 [Github: e2e-testing-tutorials](https://github.com/wnow20/e2e-testing-tutorials/tree/main/playwright/e2e-testing-java)，国内镜像[Gitee: e2e-testing-tutorials](https://gitee.com/wnow20/e2e-testing-tutorials/tree/main/playwright/e2e-testing-java)，克隆仓库后，在`playwright/e2e-testing-java` 目录中运行`mvn clean test`即可。

[Auto-Waiting]: ./playwright-guide.md#自动等待 "Auto-Waiting"
[Locator]: ./playwright-guide.md#locator "Locator"
