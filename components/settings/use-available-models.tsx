import useSWR from "swr";

interface DisplayModel {
  id: string;
  label: string;
}

type ModelsResponse = {
  models: Array<{
    id: string;
    name: string;
  }>;
};

async function fetchAvailableModels(): Promise<DisplayModel[]> {
  const response = await fetch("/api/models");
  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }

  const { models } = (await response.json()) as ModelsResponse;
  return models.map(({ id, name }) => ({ id, label: name }));
}

export function useAvailableModels() {
  const { data, error, isLoading } = useSWR("/api/models", fetchAvailableModels);
  return { models: data ?? [], isLoading, error };
}
