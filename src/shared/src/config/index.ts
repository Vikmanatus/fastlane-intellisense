import actions_list_completion from "../../actions_list.json";

export type ActionListType = {
  action_name: string;
  file_path: string;
  args: null | FastlaneConfigType[]
};

export type FastlaneConfigType = {
  key: string;
  env_name: string | null;
  description: string | null;
  default_value: boolean | string | null |string[]| Record<never, never>;
  optional: boolean | null;
  is_string: boolean | null;
  data_type: string | null;
};
export const actions_list: ActionListType[] = !actions_list_completion.length ? [] : actions_list_completion;