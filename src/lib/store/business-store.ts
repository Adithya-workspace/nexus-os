import { create } from "zustand";
import { BusinessInputs, Scenario, SimulationResult } from "@/lib/simulation/types";
import { SimulationEngine } from "@/lib/simulation/engine";
import { DEFAULT_INPUTS } from "@/lib/simulation/constants";
import { AgentReport } from "@/lib/agents/base-agent";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface BusinessStore {
  inputs: BusinessInputs;
  current: SimulationResult;
  previous: SimulationResult | null;
  scenarios: Scenario[];
  agentReports: AgentReport[];
  agentsRunning: boolean;
  chatHistory: ChatMessage[];

  updateInput: <K extends keyof BusinessInputs>(key: K, value: BusinessInputs[K]) => void;
  updateInputs: (patch: Partial<BusinessInputs>) => void;
  resetToBaseline: () => void;

  saveScenario: (name: string) => void;
  deleteScenario: (id: string) => void;
  loadScenario: (id: string) => void;

  setAgentReports: (reports: AgentReport[]) => void;
  setAgentsRunning: (running: boolean) => void;

  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
}

const initialResult = SimulationEngine.run(DEFAULT_INPUTS);

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  inputs: DEFAULT_INPUTS,
  current: initialResult,
  previous: null,
  scenarios: [],
  agentReports: [],
  agentsRunning: false,
  chatHistory: [],

  updateInput: (key, value) => {
    const nextInputs = { ...get().inputs, [key]: value };
    const previous = get().current;
    const current = SimulationEngine.run(nextInputs);
    set({ inputs: nextInputs, current, previous });
  },

  updateInputs: (patch) => {
    const nextInputs = { ...get().inputs, ...patch };
    const previous = get().current;
    const current = SimulationEngine.run(nextInputs);
    set({ inputs: nextInputs, current, previous });
  },

  resetToBaseline: () => {
    const previous = get().current;
    const current = SimulationEngine.run(DEFAULT_INPUTS);
    set({ inputs: DEFAULT_INPUTS, current, previous });
  },

  saveScenario: (name) => {
    const { current, scenarios } = get();
    const scenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name,
      inputs: current.inputs,
      result: current,
      createdAt: Date.now(),
    };
    set({ scenarios: [...scenarios, scenario] });
  },

  deleteScenario: (id) => {
    set({ scenarios: get().scenarios.filter((s) => s.id !== id) });
  },

  loadScenario: (id) => {
    const scenario = get().scenarios.find((s) => s.id === id);
    if (!scenario) return;
    const previous = get().current;
    set({ inputs: scenario.inputs, current: scenario.result, previous });
  },

  setAgentReports: (reports) => set({ agentReports: reports }),
  setAgentsRunning: (running) => set({ agentsRunning: running }),

  addChatMessage: (message) => {
    const chatMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    set({ chatHistory: [...get().chatHistory, chatMessage] });
  },
}));
