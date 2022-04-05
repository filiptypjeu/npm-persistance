import { LocalStorage } from "node-localstorage";
import { BooleanVariable, Variable } from "../index";

const ls = new LocalStorage("./src/__tests__/variables/");

describe("simple type with no domain", () => {
  afterAll(() => ls.clear());

  const str = new Variable<string>("str", "hello", ls);
  const num = new Variable<number>("num", 123, ls);

  test("get default values", () => {
    expect(str.get()).toBe("hello");
    expect(num.get()).toBe(123);
  });

  test("set and get values", () => {
    expect(str.set("AAA"));
    expect(str.get()).toBe("AAA");

    expect(num.set(321));
    expect(num.get()).toBe(321);
  });

  test("check raw localstorage item", () => {
    expect(ls.length).toBe(1);
    expect(ls.getItem("__PERSISTANCE__")).toBe('{"str":"AAA","num":321}');
  });

  test("set and get falsy values", () => {
    expect(str.set(""));
    expect(str.get()).toBe("");

    expect(num.set(0));
    expect(num.get()).toBe(0);
  });

  test("check raw localstorage item again", () => {
    expect(ls.length).toBe(1);
    expect(ls.getItem("__PERSISTANCE__")).toBe('{"str":"","num":0}');
  });

  test("toString", () => {
    expect(num.toString()).toBe("num: number = 0");
    expect(str.toString()).toBe('str: string = ""');
  });

  test("clear and get default value", () => {
    str.clear();
    expect(str.get()).toBe("hello");

    num.clear();
    expect(num.get()).toBe(123);
  });
});

describe("simple type with specific domain", () => {
  afterAll(() => ls.clear());

  const num = new Variable<number>("num", 123, ls);

  test("get default values", () => {
    expect(num.get("abc")).toBe(123);
    expect(num.get("def")).toBe(123);
  });

  test("set and get values", () => {
    expect(num.set(42, "abc"));
    expect(num.get("abc")).toBe(42);

    expect(num.set(43, "def"));
    expect(num.get("def")).toBe(43);
  });

  test("check raw localstorage items", () => {
    expect(ls.length).toBe(2);
    expect(ls.getItem("abc")).toBe('{"num":42}');
    expect(ls.getItem("def")).toBe('{"num":43}');
  });

  test("toString", () => {
    expect(num.toString("abc")).toBe("abc/num: number = 42");
    expect(num.toString("def")).toBe("def/num: number = 43");
    expect(num.toString()).toBe("num: number = 123");
  });

  test("clear and get default value", () => {
    num.clear("abc");
    expect(num.get("abc")).toBe(123);

    num.clear("def");
    expect(num.get("def")).toBe(123);
  });

  test("clear unset value", () => {
    expect(num.get("DOMAIN")).toBe(123);
    num.clear("DOMAIN");
    expect(num.get("DOMAIN")).toBe(123);
  });
});

describe("BooleanVariable", () => {
  afterAll(() => ls.clear());

  const t = new BooleanVariable("t", true, ls);
  const f = new BooleanVariable("f", false, ls);

  test("get default value", () => {
    expect(t.get()).toBe(true);
    expect(f.get()).toBe(false);
    expect(f.get("DOMAIN")).toBe(false);
  });

  test("toggle and get values", () => {
    expect(t.toggle()).toBe(false);
    expect(t.get()).toBe(false);

    expect(f.toggle()).toBe(true);
    expect(f.get()).toBe(true);

    expect(t.toggle("DOMAIN")).toBe(false);
    expect(t.get("DOMAIN")).toBe(false);

    expect(t.toggle("DOMAIN")).toBe(true);
    expect(t.get("DOMAIN")).toBe(true);
  });

  test("check raw localstorage items", () => {
    expect(ls.length).toBe(2);
    expect(ls.getItem("__PERSISTANCE__")).toBe('{"t":false,"f":true}');
    expect(ls.getItem("DOMAIN")).toBe('{"t":true}');
  });

  test("toString", () => {
    expect(t.toString()).toBe("t: boolean = false");
  });

  test("clear and get default value", () => {
    t.clear();
    expect(t.get()).toBe(true);

    f.clear();
    expect(f.get()).toBe(false);
  });
});

describe("complex type", () => {
  afterAll(() => ls.clear());

  interface ITestA {
    a: string[];
    b: number[];
    c?: ITestA;
  }

  const d: ITestA = {
    a: ["a"],
    b: [1],
  };

  const obj = new Variable<ITestA>("obj", d, ls);

  test("get default value", () => {
    expect(obj.get()).toEqual(d);
    expect(obj.get("1234")).toEqual(d);
  });

  const value: ITestA = {
    ...d,
    b: [42, 43],
    c: {
      a: ["b", "c"],
      b: [2, 3],
    },
  };

  test("set and get value", () => {
    expect(obj.set(value));
    expect(obj.get()).toEqual(value);

    expect(obj.set(value, "1234"));
    expect(obj.get("1234")).toEqual(value);
  });

  test("check raw localstorage items", () => {
    expect(ls.length).toBe(2);
    expect(ls.getItem("__PERSISTANCE__")).toBe('{"obj":{"a":["a"],"b":[42,43],"c":{"a":["b","c"],"b":[2,3]}}}');
    expect(ls.getItem("1234")).toBe('{"obj":{"a":["a"],"b":[42,43],"c":{"a":["b","c"],"b":[2,3]}}}');
  });

  test("toString", () => {
    expect(obj.toString("1234")).toBe('1234/obj: object = {"a":["a"],"b":[42,43],"c":{"a":["b","c"],"b":[2,3]}}');
  });

  test("clear and get value", () => {
    obj.clear();
    expect(obj.get()).toEqual(d);

    obj.clear("1234");
    expect(obj.get("1234")).toEqual(d);
  });
});

describe("callback", () => {
  afterAll(() => ls.clear());

  var mynymber = 0;
  var mydomain: string | undefined;
  const num = new Variable<number>("num", 100, ls, (newValue: number, domain?: string) => {
    mynymber = newValue + 1;
    mydomain = domain;
  });

  test("set value", () => {
    num.set(42);
    expect(mynymber).toBe(43);
    expect(mydomain).toBe(undefined);

    num.set(50, "50");
    expect(mynymber).toBe(51);
    expect(mydomain).toBe("50");
  });

  test("clear value", () => {
    num.clear();
    expect(mynymber).toBe(101);
    expect(mydomain).toBe(undefined);

    num.clear("50");
    expect(mynymber).toBe(101);
    expect(mydomain).toBe("50");
  });
});
