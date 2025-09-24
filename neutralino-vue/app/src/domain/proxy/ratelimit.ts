class TokenBucket {
  private capacity: number;
  private tokens: number;
  private refillPerSec: number;
  private last: number;
  constructor(rps = 2, burst = 4){
    this.capacity = burst;
    this.tokens = burst;
    this.refillPerSec = rps;
    this.last = Date.now();
  }
  async take(){
    while(true){
      const now = Date.now();
      const delta = (now - this.last)/1000;
      this.last = now;
      this.tokens = Math.min(this.capacity, this.tokens + delta*this.refillPerSec);
      if(this.tokens >= 1){ this.tokens -= 1; return; }
      await new Promise(r=>setTimeout(r, 50));
    }
  }
}

export const rateLimiter = new TokenBucket(2, 4);
