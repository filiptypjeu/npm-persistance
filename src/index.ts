export interface ILocalStorage {
  getItem(itemName: string): string | null;
  setItem(itemName: string, value: string): void;
}

export interface IVariableOptions<T> {
  name: string;
  defaultValue: T;
  description?: string;
}

interface IItem<T> {
  [key: string]: T;
}

type DomainName = string | number;

export class Variable<T> {
  protected m_type;

  constructor(
    public readonly name: string,
    public defaultValue: T,
    public readonly ls: ILocalStorage,
    public callback?: (newValue: T, domainName?: string) => void
  ) {
    this.m_type = typeof this.defaultValue;
  }

  protected domainToString = (domain?: DomainName): string | undefined => domain?.toString();

  protected itemName = (domain?: DomainName): string => this.domainToString(domain) || "__PERSISTANCE__";

  protected getItem(domain?: DomainName): IItem<T> {
    const str = this.ls.getItem(this.itemName(domain?.toString()));
    return str ? JSON.parse(str) : {};
  };

  protected setItem(object: IItem<T>, domain?: DomainName): void {
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
   * Set the value of this variable using a string that is then parsed correctly depending on the type of the variable value.
   *
   * @returns true if the value was set successfully.
   */
  public setWithString(value: string, domain?: DomainName): boolean {
    let v: T;
    if (this.m_type === "string") v = value as any;
    else {
      try {
        v = JSON.parse(value);
      } catch {
        return false;
      }
    }
    if (typeof v !== this.m_type) return false;
    this.set(v, domain);
    return true;
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

  /**
   * Set the value of this variable using a string that is then parsed correctly depending on the type of the variable value.
   *
   * @returns true always.
   */
  public override setWithString(value: string, domain?: DomainName): boolean {
    let v: any;
    try {
      v = JSON.parse(value);
    } catch {
      v = value;
    }
    this.set(v ? true : false, domain);
    return true;
  };
}
