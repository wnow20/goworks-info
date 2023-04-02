# TypeScript学习笔记

### JavaScript基本类型

`boolean`, `bigint`, `null`, `number`, `string`, `symbol`, and `undefined`

### TypeScript新增的基本类型

`any` , `unknown` , `never` , `void` 

<br/>

### 高级常量


```typescript
const myUnchangingUser = {
  name: "Fatma",
} as const;
const exampleUsers = [{ name: "Brian" }, { name: "Fahrooq" }] as const;
```

### Union


```typescript
type StringOrNumber = string | number;
type ProcessStates = "open" | "closed";
type OddNumbersUnderTen = 1 | 3 | 5 | 7 | 9;
type AMessyUnion = "hello" | 156 | { error: true };
```

### Intersection


```typescript
// If a union is an OR, then an intersection is an AND.
// Intersection types are when two types intersect to create
// a new type. This allows for type composition.

interface ErrorHandling {
  success: boolean;
  error?: { message: string };
}

interface ArtworksData {
  artworks: { title: string }[];
}

interface ArtistsData {
  artists: { name: string }[];
}

// These interfaces can be composed in responses which have
// both consistent error handling, and their own data.

type ArtworksResponse = ArtworksData & ErrorHandling;
type ArtistsResponse = ArtistsData & ErrorHandling;
```

If a union is an **OR**, then an intersection is an **AND**.

### 枚举


```typescript
enum StatusCodes {
  OK = 200,
  BadRequest = 400,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
}

// Enums support accessing data in both directions from key
// to value, and value to key.

const okNumber = StatusCodes.OK;
const okNumberIndex = StatusCodes["OK"];
const stringBadRequest = StatusCodes[400];
```

<br/>

### 元组类型


```typescript
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
// Initialize it incorrectly
x = [10, 'hello']; // Error
```

<br/>

### **Null 和 Undefined**

TypeScript里，`undefined`和`null`两者各自有自己的类型分别叫做`undefined`和`null`。 和 `void`相似。默认情况下`null`和`undefined`是所有类型的子类型。

<br/>

### Never

`never`类型表示的是那些永不存在的值的类型。 例如， `never`类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型； 变量也可能是 `never`类型，当它们被永不为真的类型保护所约束时。

`never`类型是任何类型的子类型，也可以赋值给任何类型；然而，*没有*类型是`never`的子类型或可以赋值给`never`类型（除了`never`本身之外）。 即使 `any`也不可以赋值给`never`。

<br/>

### **类型断言**


```typescript
// 方式一
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;

// 方式二
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;
```

<br/>

### 接口


```typescript
interface Point {
    color?: string; // 可选属性
    [propName: string]: any; // 额外属性
    readonly y: number; // 只读属性
    func: (source: string, subString: string) => boolean; // 函数类型
}
let ro: ReadonlyArray<number> = a;
```

<br/>

### 函数类型


```typescript
interface SearchFunc {
  (source: string, subString: string): boolean;
}
let mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
  let result = source.search(subString);
  return result > -1;
}
```

### **可索引的类型**


```typescript
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0];
```

<br/>

### **把类当做接口使用**

如上一节里所讲的，类定义会创建两个东西：类的实例类型和一个构造函数。 因为类可以创建出类型，所以你能够在允许使用接口的地方使用类。


```typescript
class Point {
    x: number;
    y: number;
}

interface Point3d extends Point {
    z: number;
}

let point3d: Point3d = {x: 1, y: 2, z: 3};
```

<br/>

箭头函数

箭头函数能保存函数创建时的 `this`值，而不是调用时的值：


```typescript
interface Card {
    suit: string;
    card: number;
}
interface Deck {
    suits: string[];
    cards: number[];
    createCardPicker(this: Deck): () => Card;
}
let deck: Deck = {
    suits: ["hearts", "spades", "clubs", "diamonds"],
    cards: Array(52),
    // NOTE: The function now explicitly specifies that its callee must be of type Deck
    createCardPicker: function(this: Deck) {
        return () => {
            let pickedCard = Math.floor(Math.random() * 52);
            let pickedSuit = Math.floor(pickedCard / 13);

            return {suit: this.suits[pickedSuit], card: pickedCard % 13};
        }
    }
}

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

<br/>

`***this***`***参数在回调函数里***


```typescript
interface UIElement {
    addClickListener(onclick: (this: void, e: Event) => void): void;
}
```

<br/>

### 泛型


```typescript
function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: <T>(arg: T) => T = identity;
```

<br/>

我们还可以使用带有调用签名的对象字面量来定义泛型函数：


```typescript
function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: {<T>(arg: T): T} = identity;
```

<br/>

泛型接口


```typescript
interface GenericIdentityFn {
    <T>(arg: T): T;
}

function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: GenericIdentityFn = identity;
```


```typescript
interface GenericIdentityFn<T> {
    (arg: T): T;
}

function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

<br/>

**在泛型约束中使用类型参数**


```typescript
function getProperty(obj: T, key: K) {
    return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a"); // okay
getProperty(x, "m"); // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.
```

<br/>

