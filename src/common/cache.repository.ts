import { Inject } from "@nestjs/common";
import { KEYV_INSTANCE } from "./keyv.provider";
import Keyv from "keyv";

export abstract class CacheRepository {
    @Inject(KEYV_INSTANCE) protected keyv: Keyv;

    protected abstract getNameSpace(): string;

    protected async invalidateNameSpace(): Promise<void> {
        const cacheWithNameSpace = new Keyv({ store: this.keyv.opts.store, namespace: this.getNameSpace() });
        await cacheWithNameSpace.clear();
    }

    protected getCacheKey(args: any): string {
        const queryHash = JSON.stringify(args || {});
        return `${this.getNameSpace()}:${queryHash}`;
    }
}