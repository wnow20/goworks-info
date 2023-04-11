
# 用Java测试终端命令

### 介绍
本文讲述，如何通过Java单元测试，运行终端命令，通过`Process`执行终端命令，查询运行结果以及维护命令声明周期。

通过`ProcessBuilder.start()` 和 `Runtime.exec` 方法创建一个本机进程并返回一个 [Process](https://docs.oracle.com/javase/8/docs/api/java/lang/Process.html) 子类的实例，该实例可用于控制该进程并获取有关它的信息。 `Process` 类提供了从进程执行输入、向进程执行输出、等待进程完成、检查进程退出状态和销毁（杀死）进程的方法。

创建进程的方法可能不适用于某些原生平台上的特殊进程，例如原生窗口进程、守护进程、Microsoft Windows 上的 Win16/DOS 进程或 shell 脚本。

默认情况下，创建的子进程没有自己的终端或控制台。 它的所有标准 I/O（即 stdin、stdout、stderr）操作将被重定向到父进程，可以通过使用 `Process` 实例的方法 `getOutputStream()`、`getInputStream()` 和 `getErrorStream()` 获得的流来访问（标准IO）。 父进程使用这些流向子进程提供输入并从中获取输出。 由于一些原生平台只为标准输入输出流提供有限的缓冲区大小，如果不能及时写入子进程的输入流或读取输出流，可能会导致子进程阻塞，甚至死锁。

如果需要，也可以使用 `ProcessBuilder` 类的方法重定向子进程 I/O。

当不再有对 `Process` 对象的引用时，子进程不会被终止，而是子进程继续异步执行。

从 JDK 1.5 开始，`ProcessBuilder.start()` 是创建进程的首选方法。

### 快速开始

```java
@Test
void test_pwd_command() throws IOException {
    Process exec = new ProcessBuilder()
        .command("pwd")
        .start();

    System.out.println("output:");
    try (BufferedReader in = new BufferedReader(new InputStreamReader(exec.getInputStream()))) {
        System.out.println(in.readLine());
    }
}
```

示例输出：

```plain
output:
/Users/ge/workspace/wnow20/e2e-testing/playwright/e2e-testing-java
```

**代码讲解**

1. 使用 `ProcessBuilder` 构建命令，并通过 `start()` 执行命令，并返回 `Process` 实例；
2. 通过 `getInputStream()` 获取标准输入流，用于接收命令的输出结果；
3. 输出`pwd`返回的结果，即命令执行的当前目录；

[pwd](https://man7.org/linux/man-pages/man1/pwd.1.html) 命令使用说明，请参考 [man7.org](https://man7.org/linux/man-pages/man1/pwd.1.html)

### 使用标准输入（stdin）

```java
@Test
void test_sed_command2() throws IOException, InterruptedException {
    Process process = new ProcessBuilder()
        .redirectErrorStream(true)
        .command("cat")
        .start();

    new Thread(() -> {
        InputStream inputStream = process.getInputStream();
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(inputStream));

            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                System.out.println(inputLine);
            }
        } catch (IOException e) {
            // terminate
        }
    }).start();

    new Thread(() -> {
        try (OutputStream outputStream = process.getOutputStream()) {
            outputStream.write("a\n".getBytes());
            outputStream.flush();
            Thread.sleep(500);
            outputStream.write("b\n".getBytes());
            outputStream.flush();
            Thread.sleep(500);
            outputStream.write("c\n".getBytes());
            outputStream.flush();
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }).start();

    process.waitFor();
}
```

示例输出：
```plain
a
b
c
```

**代码讲解**
1. 这里我们为输入、输出建立一个子线程；
2. 输入流写入三行，每行一个单词，以回车符结束，并且执行 `flush` 方法，这样能做到命令行分次处理数据；
3. 最后我们使用 `waitFor` 方法，等待终端处理完毕，当且仅当输入流关后关闭后，输出流打印完所有结果，才会终止 `Process` 实例；

### 启动持续性的命令行

在工作当中，我们尝尝接触web应用，那么如何在Java中启动一个web应用，我们可能需要独立启动一个Web应用用于E2E测试，接下来是代码演示：

```java
@Test
void test_start_todo_app_by_command() throws InterruptedException, IOException {
    CountDownLatch latch = new CountDownLatch(1);

    Thread thread = new Thread(() -> {
        try {
            String path = currentPath();
            Path todoAppPath = Paths.get(path).resolve("../../todo-app").normalize();
            Process exec = new ProcessBuilder()
                .directory(todoAppPath.toFile())
                .command("npm", "start")
                .start();
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("destroy todo app");
                exec.destroy();
            }));
            try (BufferedReader in = new BufferedReader(new InputStreamReader(exec.getInputStream()))) {
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    System.out.println(inputLine);
                    if (inputLine.startsWith("Serving on")) {
                        latch.countDown();
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
        }
    });
    thread.start();
    threadLocal.set(thread);
    latch.await();

    URL url = new URL("http://localhost:4200/");
    HttpURLConnection con = (HttpURLConnection)url.openConnection();
    con.connect();

    try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
        String inputLine;
        StringBuilder content = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            content.append(inputLine);
        }
        assertTrue(content.toString().contains("<title>React • TodoMVC</title>"));
    }
    con.disconnect();
}
```

**代码解释**
1. 命令行启动web应用，由于web应用执行是持续执行的，因此在Java单元测试中需要通过子线程运行，避免阻断主线程；
2. 使用 `CountDownLatch` 用于判断web应用是否启动完毕；
3. 在主线程结束时，需要终止web应用，这里使用 `addShutdownHook`实现；

### 总结
本文讲述了 `Process` 实例的创建、运行，以及对标准IO的操作，并且对web应用E2E测试场景进行了说明。本文所有代码请查阅 [e2e-testing-tutorials](https://github.com/wnow20/e2e-testing-tutorials)，国内镜像清访问 [gitee](https://gitee.com/wnow20/e2e-testing-tutorials)，感谢你的阅读。
