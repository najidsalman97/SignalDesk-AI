/**
 * Progress Reporter - Live progress updates for analysis
 */

export type AnalysisPhase = 
  | "preparing"
  | "estimating"
  | "chunking"
  | "analyzing"
  | "retrying"
  | "switching_provider"
  | "merging"
  | "generating"
  | "completed"
  | "failed"
  | "cancelled";

export interface AnalysisProgress {
  phase: AnalysisPhase;
  message: string;
  currentChunk?: number;
  totalChunks?: number;
  currentProvider?: string;
  percentComplete: number;
  startTime: number;
  elapsedMs: number;
  estimatedRemainingMs?: number;
}

export type ProgressCallback = (progress: AnalysisProgress) => void;

/**
 * Progress Reporter class for tracking analysis progress
 */
export class ProgressReporter {
  private startTime: number;
  private callback: ProgressCallback;
  private currentPhase: AnalysisPhase = "preparing";
  private totalChunks: number = 1;
  private completedChunks: number = 0;
  private currentProvider: string = "";
  
  constructor(callback: ProgressCallback) {
    this.startTime = Date.now();
    this.callback = callback;
  }
  
  private emit(message: string, percentComplete?: number) {
    const now = Date.now();
    const elapsedMs = now - this.startTime;
    
    // Calculate percentage based on phase and chunks
    let percent = percentComplete;
    if (percent === undefined) {
      percent = this.calculatePercentage();
    }
    
    // Estimate remaining time
    let estimatedRemainingMs: number | undefined;
    if (percent > 0 && percent < 100) {
      estimatedRemainingMs = (elapsedMs / percent) * (100 - percent);
    }
    
    this.callback({
      phase: this.currentPhase,
      message,
      currentChunk: this.completedChunks + 1,
      totalChunks: this.totalChunks,
      currentProvider: this.currentProvider,
      percentComplete: percent,
      startTime: this.startTime,
      elapsedMs,
      estimatedRemainingMs,
    });
  }
  
  private calculatePercentage(): number {
    // Phase weights
    const phaseWeights: Record<AnalysisPhase, [number, number]> = {
      preparing: [0, 5],
      estimating: [5, 10],
      chunking: [10, 15],
      analyzing: [15, 80],
      retrying: [15, 80], // Same as analyzing
      switching_provider: [15, 80], // Same as analyzing
      merging: [80, 90],
      generating: [90, 100],
      completed: [100, 100],
      failed: [0, 0],
      cancelled: [0, 0],
    };
    
    const [start, end] = phaseWeights[this.currentPhase];
    
    if (this.currentPhase === "analyzing" && this.totalChunks > 1) {
      const chunkProgress = this.completedChunks / this.totalChunks;
      return start + (end - start) * chunkProgress;
    }
    
    return start;
  }
  
  // Public methods for updating progress
  
  preparing() {
    this.currentPhase = "preparing";
    this.emit("Preparing analysis...");
  }
  
  estimating(reviewCount: number) {
    this.currentPhase = "estimating";
    this.emit(`Estimating tokens for ${reviewCount} reviews...`);
  }
  
  chunking(chunkCount: number) {
    this.currentPhase = "chunking";
    this.totalChunks = chunkCount;
    this.emit(`Splitting into ${chunkCount} chunk${chunkCount > 1 ? "s" : ""}...`);
  }
  
  analyzingChunk(chunkIndex: number, provider: string) {
    this.currentPhase = "analyzing";
    this.currentProvider = provider;
    this.completedChunks = chunkIndex;
    this.emit(`Analyzing chunk ${chunkIndex + 1} of ${this.totalChunks} with ${provider}...`);
  }
  
  chunkCompleted(chunkIndex: number) {
    this.completedChunks = chunkIndex + 1;
    this.emit(`Chunk ${chunkIndex + 1} completed`);
  }
  
  retrying(attempt: number, delayMs: number, reason: string) {
    this.currentPhase = "retrying";
    this.emit(`Retry ${attempt}: ${reason}. Waiting ${Math.round(delayMs / 1000)}s...`);
  }
  
  switchingProvider(fromProvider: string, toProvider: string, reason: string) {
    this.currentPhase = "switching_provider";
    this.currentProvider = toProvider;
    this.emit(`${reason} Switching from ${fromProvider} to ${toProvider}...`);
  }
  
  merging() {
    this.currentPhase = "merging";
    this.emit("Merging partial results...");
  }
  
  generating() {
    this.currentPhase = "generating";
    this.emit("Generating executive report...");
  }
  
  completed(totalReviews: number, elapsedSeconds: number) {
    this.currentPhase = "completed";
    this.emit(`Analysis complete! Processed ${totalReviews} reviews in ${elapsedSeconds.toFixed(1)}s`, 100);
  }
  
  failed(error: string) {
    this.currentPhase = "failed";
    this.emit(`Analysis failed: ${error}`, 0);
  }
  
  cancelled() {
    this.currentPhase = "cancelled";
    this.emit("Analysis cancelled", 0);
  }
}
