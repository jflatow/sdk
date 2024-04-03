// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

export interface Activatable {
  activate(...args: any[]): Promise<void>;
  deactivate(...args: any[]): Promise<void>;
}

export interface Selectable {
  select(...args: any[]): boolean | void;
  deselect(...args: any[]): boolean | void;
}

export class Stack<T extends Activatable> {
  members: T[];

  constructor() {
    this.members = [];
  }

  get active(): T {
    return this.members[0];
  }

  async activate(index: number): Promise<T> {
    if (index >= 0 && index < this.members.length) {
      const [active] = this.members.splice(index, 1);
      await Promise.all(this.members.map((m, i) => m.deactivate(this, i)));
      await active.activate(this, index);
      this.members.unshift(active);
      return active;
    } else {
      throw new Error(`non-existent index: ${index}`);
    }
  }

  async activateMember(member: T): Promise<T> {
    return await this.activate(this.members.findIndex(m => m === member));
  }

  async addMember(member: T): Promise<void> {
    if (!this.members.includes(member))
      this.members.push(member);
    if (this.active === member)
      await member.activate(this);
  }

  async removeMember(member: T): Promise<void> {
    const i = this.members.findIndex(m => m === member);
    if (this.active === member)
      await member.deactivate(this);
    if (i >= 0)
      this.members.splice(i, 1);
  }

  findMemberByClass(c: { new (...args: any[]): T }): T | undefined {
    return this.members.find(m => m instanceof c) as T;
  }
}

export class Selection<T extends Selectable> {
  members: Set<T>;

  constructor() {
    this.members = new Set;
  }

  get selected(): T[] {
    return [...this.members];
  }

  select(...members: T[]) {
    this.removeSelected(...this.members);
    this.addSelected(...members);
  }

  addSelected(...members: T[]) {
    for (const member of members)
      if (member.select(this) ?? true)
        this.members.add(member);
  }

  removeSelected(...members: T[]) {
    for (const member of members)
      if (member.deselect(this) ?? true)
        this.members.delete(member);
  }

  contains(member: T): boolean {
    return this.members.has(member);
  }
}
