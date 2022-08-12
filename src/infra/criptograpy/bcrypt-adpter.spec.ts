import bcrypt from "bcrypt";
import { BcryptAdapter } from "./bcript-adapter";

jest.mock("bcrypt", () => ({
	async hash(): Promise<string> {
		return new Promise((resolve) => resolve("hash"));
	},
}));
const salt = 12;
const makesut = (): BcryptAdapter => {
	return new BcryptAdapter(salt);
};

describe("Bcrypt Adapter", () => {
	test("should call bcrypt with correct values", async () => {
		const sut = makesut();
		const hashSpy = jest.spyOn(bcrypt, "hash");
		await sut.encrypt("any_value");
		expect(hashSpy).toHaveBeenCalledWith("any_value", salt);
	});
	test("should return a hash on success", async () => {
		const sut = makesut();
		const hash = await sut.encrypt("any_value");
		expect(hash).toBe("hash");
	});
});