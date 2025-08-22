import { useMemo } from "react";
import { supabase } from "src/lib/supabase";
import { OptionsEnum } from "src/types/option";
import useSWR from "swr";

export function useGetOption(option: OptionsEnum) {
  const SWR_KEY = `option-${option}`;
  const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
    const { data: optionData, error: dbError } = await supabase
      .from('Options')
      .select('value')
      .eq('name', option)
      .maybeSingle();

    if (dbError) throw new Error(dbError.message);
    return optionData?.value;
  });

  return useMemo(() => ({
      option: data || null,
      optionLoading: isLoading,
      optionError: error,
      optionMutate: mutate,
    }), [data, error, isLoading, mutate]);
}