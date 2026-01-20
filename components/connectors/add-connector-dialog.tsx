"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { AuthType, CreateConnectorInput, MCPServerAuth } from "./use-mcp-connectors";

const AUTH_OPTIONS: { value: AuthType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "bearer", label: "Bearer" },
  { value: "headers", label: "Headers" },
  { value: "oauth", label: "OAuth" },
];

interface AddConnectorDialogProps {
  onAdd: (input: CreateConnectorInput) => Promise<void> | void;
}

export function AddConnectorDialog({ onAdd }: AddConnectorDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [authType, setAuthType] = useState<AuthType>("none");
  const [bearerToken, setBearerToken] = useState("");
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [oauthClientId, setOauthClientId] = useState("");
  const [oauthClientSecret, setOauthClientSecret] = useState("");
  const [oauthTokenUrl, setOauthTokenUrl] = useState("");

  const resetForm = () => {
    setName("");
    setUrl("");
    setAuthType("none");
    setBearerToken("");
    setHeaderKey("");
    setHeaderValue("");
    setOauthClientId("");
    setOauthClientSecret("");
    setOauthTokenUrl("");
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    let auth: MCPServerAuth | null | undefined = null;

    if (authType === "bearer") {
      auth = { type: "bearer", bearer: bearerToken.trim() };
    } else if (authType === "headers") {
      auth = {
        type: "headers",
        headers: { [headerKey.trim()]: headerValue.trim() },
      };
    } else if (authType === "oauth") {
      auth = {
        type: "oauth",
        oauth: {
          clientId: oauthClientId.trim(),
          clientSecret: oauthClientSecret.trim(),
          tokenUrl: oauthTokenUrl.trim(),
        },
      };
    } else if (authType === "none") {
      auth = null;
    }

    await onAdd({
      name: name.trim(),
      url: url.trim(),
      ...(auth !== undefined ? { auth } : {}),
    });

    resetForm();
    setOpen(false);
  };

  const isValid =
    Boolean(name.trim() && url.trim()) &&
    (authType === "none" ||
      (authType === "bearer" && Boolean(bearerToken.trim())) ||
      (authType === "headers" && Boolean(headerKey.trim() && headerValue.trim())) ||
      (authType === "oauth" &&
        Boolean(oauthClientId.trim() && oauthClientSecret.trim() && oauthTokenUrl.trim())));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          Add connector
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Custom MCP Connection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Ex. My Custom MCP"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://mcp.website.com/mcp"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Authentication</Label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-lg">
              {AUTH_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAuthType(option.value)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    authType === option.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-30 rounded-lg border border-border bg-muted/30 p-4">
            {authType === "none" && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No authentication method selected.
              </p>
            )}

            {authType === "bearer" && (
              <div className="space-y-2">
                <Label htmlFor="bearer">Bearer Token</Label>
                <Input
                  id="bearer"
                  type="password"
                  placeholder="Enter your bearer token"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                />
              </div>
            )}

            {authType === "headers" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="headerKey">Header Name</Label>
                  <Input
                    id="headerKey"
                    placeholder="X-API-Key"
                    value={headerKey}
                    onChange={(e) => setHeaderKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headerValue">Header Value</Label>
                  <Input
                    id="headerValue"
                    type="password"
                    placeholder="Enter header value"
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                  />
                </div>
              </div>
            )}

            {authType === "oauth" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="Enter client ID"
                    value={oauthClientId}
                    onChange={(e) => setOauthClientId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Enter client secret"
                    value={oauthClientSecret}
                    onChange={(e) => setOauthClientSecret(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenUrl">Token URL</Label>
                  <Input
                    id="tokenUrl"
                    placeholder="https://auth.example.com/oauth/token"
                    value={oauthTokenUrl}
                    onChange={(e) => setOauthTokenUrl(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
