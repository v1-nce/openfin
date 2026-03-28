import { MockProvider } from "@/providers/mock/provider";
import { TinyFishProvider } from "@/providers/tinyfish/provider";
import type { ExtractionProvider, ProviderExtractionBundle } from "@/providers/types";
import type { AnalyzeRequest, SourcePlan } from "@/schemas";

export function getProvider(request: AnalyzeRequest): ExtractionProvider {
  if (request.mode === "live") {
    return new TinyFishProvider();
  }

  return new MockProvider();
}

export async function runProviderExtraction(
  request: AnalyzeRequest,
  plan: SourcePlan
): Promise<ProviderExtractionBundle & { providerName: string }> {
  const provider = getProvider(request);
  const result = await provider.extract(request, plan);

  return {
    ...result,
    providerName: provider.name
  };
}
