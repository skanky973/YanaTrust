export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
  redirectTo?: string;
};

export const INITIAL_ACTION_STATE: ActionState = {};
