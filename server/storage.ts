import { workflows, type Workflow, type InsertWorkflow } from "@shared/schema";

export interface IStorage {
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  getAllWorkflows(): Promise<Workflow[]>;
}

export class MemStorage implements IStorage {
  private workflows: Map<number, Workflow>;
  currentId: number;

  constructor() {
    this.workflows = new Map();
    this.currentId = 1;
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentId++;
    const workflow: Workflow = { 
      ...insertWorkflow, 
      id, 
      createdAt: new Date() 
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }
}

export const storage = new MemStorage();
