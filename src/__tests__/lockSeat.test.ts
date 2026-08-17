import { describe, it, expect, vi } from "vitest"
import redis from "../config/redis.js"
import { lockSeat } from "../booking/redisLock.js"

vi.mock("../config/redis.js", () => ({
    default: {
        set: vi.fn()
    }
}))

describe("lockSeat", () => {
    it("should succeed when seat is not locked", async() => {
        (redis.set as any).mockResolvedValue("OK")
        const result = await lockSeat(1, 5)
        expect(result).toBe(true)
    })

    it("should throw when seat is already locked", async() => {
        (redis.set as any).mockResolvedValue(null)

        await expect(lockSeat(1,5)).rejects.toThrow("Seat is already locked by another user")
    })
})