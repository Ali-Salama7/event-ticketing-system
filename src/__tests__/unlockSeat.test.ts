import { describe, it, expect, vi } from "vitest"
import redis from "../config/redis.js"
import { unlockSeat } from "../booking/redisLock.js"

vi.mock("../config/redis.js", () => ({
    default: {
        get: vi.fn(),
        del: vi.fn()
    }
}))

describe("unlockSeat", () => {
    it("should succeed when the same user who locked it tries to unlock", async() => {
        (redis.get as any).mockResolvedValue("1");
        (redis.del as any).mockResolvedValue(1);

        const result = await unlockSeat(5,1)
        expect(result).toBe(1)
    })

    it("should throw ForbiddenError when a different user tries to unlock", async() => {
        (redis.get as any).mockResolvedValue("1")
        await expect(unlockSeat(5,2)).rejects.toThrow(
            "You cannot unlock a seat locked by another user"
        )
    })

    it("should return undefined when there is no active lock", async() => {
        (redis.get as any).mockResolvedValue(null)

        const result = await unlockSeat(5,1)
        expect(result).toBeUndefined()
    })
})