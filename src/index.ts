interface ILocalStorage {
  getItem(itemName: string): string | null;
  setItem(itemName: string, value: string): void;
}

export interface IVariableOptions<T> {
  name: string;
  defaultValue: T;
  description?: string;
}

interface IItem {
  [key: string]: any;
}

export class Variable<T> {
  constructor(
    public readonly name: string,
    public defaultValue: T,
    public readonly ls: ILocalStorage,
    public callback?: (newValue: T, domain?: string) => void
  ) {}

  protected itemName = (domain?: string) => domain || "__PERSISTANCE__";

  protected getItem(domain?: string): IItem {
    const str = this.ls.getItem(this.itemName(domain));
    return str ? JSON.parse(str) : {};
  };

  protected setItem(object: IItem, domain?: string): void {
    this.ls.setItem(this.itemName(domain), JSON.stringify(object));
    if (this.callback) {
      this.callback(this.get(domain), domain?.toString());
    }
  };

  /**
   * Get the value of this variable in a specific or the default domain.
   */
  public get(domain?: string): T {
    const d = this.getItem(domain);
    return this.name in d ? d[this.name] : this.defaultValue;
  };

  /**
   * Set the value of this variable in a specific or the default domain.
   */
  public set(value: T, domain?: string): void {
    const d = this.getItem(domain);
    d[this.name] = value;
    this.setItem(d, domain);
  };

  /**
   * Reset this variable to the default value.
   */
  public clear(domain?: string): void {
    const d = this.getItem(domain);
    delete d[this.name];
    this.setItem(d, domain);
  };
}

export class BooleanVariable extends Variable<boolean> {
  /**
   * Toggle the state of this Variable.
   *
   * @returns the new state.
   */
  public toggle(domain?: string): boolean {
    const newValue = !this.get(domain);
    this.set(newValue, domain);
    return newValue;
  };
}
