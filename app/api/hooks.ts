import { useMemo } from "react";
import useSWR from "swr";
import type { SWRConfiguration } from "swr/_internal";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

import { type GETResponse, type POSTResponse } from "@/app/api/chats/route";

export const useListMessagesQuery = (chatId: string | null, config?: SWRConfiguration) => {
  return useSWR(
    chatId ? `/api/chats/${chatId}/messages` : null,
    async (key) => {
      const res = await fetch(key);
      if (!res.ok) {
        const error = new Error(`Failed to load messages (${res.status})`);
        (error as Error & { status?: number }).status = res.status;
        throw error;
      }
      return res.json();
    },
    {
      refreshInterval: 0,
      ...config,
    },
  );
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useListChatsQuery = ({ query }: { query: string }, config?: SWRConfiguration) => {
  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "50");
    params.set("offset", "0");
    if (query.trim()) params.set("q", query.trim());
    return `/api/chats?${params.toString()}`;
  }, [query]);

  return useSWR<GETResponse>(listUrl, fetcher, {
    keepPreviousData: true,
    fallbackData: { chats: [] },
    ...config,
  });
};

type CreateChatArg = {
  title?: string;
};
export const useCreateChatMutation = <
  Res = POSTResponse,
  Err = Error,
  Arg extends CreateChatArg = CreateChatArg,
>(
  config?: SWRMutationConfiguration<Res, Err, "/api/chats", Arg>,
) => {
  return useSWRMutation<Res, Err, "/api/chats", Arg>(
    "/api/chats",
    async (url, { arg }) => {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ title: arg?.title ?? "New Chat" }),
      });
      return res.json();
    },
    {
      ...config,
    },
  );
};

export const useBatchDeleteChatsMutation = () => {
  return useSWRMutation<
    { deletedIds: string[]; deletedCount: number },
    unknown,
    string,
    { chatIds: string[] }
  >("/api/chats/batch-delete", async (url, { arg }) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chatIds: arg.chatIds }),
    });
    return res.json();
  });
};
