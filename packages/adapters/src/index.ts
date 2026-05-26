export interface Adapter<TConfig = Record<string, unknown>> {
  name: string;
  setup(config: TConfig): Promise<void> | void;
}
