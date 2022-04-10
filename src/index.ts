export interface ILocalStorage {
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

type DomainName = string | number;

export class Variable<T> {
  constructor(
    public readonly name: string,
    public defaultValue: T,
    public readonly ls: ILocalStorage,
    public callback?: (newValue: T, domainName?: string) => void
  ) {}

  protected domainToString = (domain?: DomainName): string | undefined => domain?.toString();

  protected itemName = (domain?: DomainName): string => this.domainToString(domain) || "__PERSISTANCE__";

  protected getItem(domain?: DomainName): IItem {
    const str = this.ls.getItem(this.itemName(domain?.toString()));
    return str ? JSON.parse(str) : {};
  };

  protected setItem(object: IItem, domain?: DomainName): void {
    this.ls.setItem(this.itemName(domain?.toString()), JSON.stringify(object));
    if (this.callback) {
      this.callback(this.get(domain), this.domainToString(domain));
    }
  };

  public toString(domain?: DomainName): string {
    return `${domain ? `${domain}/` : ""}${this.name}: ${typeof this.defaultValue} = ${JSON.stringify(this.get(domain))}`;
  }

  /**
   * Get the value of this variable in a specific or the default domain.
   */
  public get(domain?: DomainName): T {
    const d = this.getItem(domain);
    return this.name in d ? d[this.name] : this.defaultValue;
  };

  /**
   * Set the value of this variable in a specific or the default domain.
   */
  public set(value: T, domain?: DomainName): void {
    const d = this.getItem(domain);
    d[this.name] = value;
    this.setItem(d, domain);
  };

  /**
   * Reset this variable to the default value.
   */
  public clear(domain?: DomainName): void {
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
  public toggle(domain?: DomainName): boolean {
    const newValue = !this.get(domain);
    this.set(newValue, domain);
    return newValue;
  };
}
