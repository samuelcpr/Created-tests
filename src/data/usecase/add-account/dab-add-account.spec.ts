import {
	Encrypter,
	AddAccountModel,
	AccountModel,
	AddAccountRepository,
} from "./db-add-account-protocols";
import { DbAddAccount } from "./db-add-account";

const makerEncrypter = (): Encrypter => {
	class EncryptStub implements Encrypter {
		async encrypt(value: string): Promise<string> {
			return new Promise((resolve) => resolve("hashed_password"));
		}
	}
	return new EncryptStub();
};

const makeAddAccountRepository = (): AddAccountRepository => {
	class addAccountRepositoryStub implements AddAccountRepository {
		async add(accountData: AddAccountModel): Promise<AccountModel> {
			const fakeAccount = {
				id: "valid_id",
				name: "valid_name",
				email: "valid_email",
				password: "hashed_password",
			};
			return new Promise((resolve) => resolve(fakeAccount));
		}
	}
	return new addAccountRepositoryStub();
};

interface SutTypes {
	sut: DbAddAccount;
	encryptStub: Encrypter;
	addAccountRepositoryStub: AddAccountRepository;
}

const makeSut = (): SutTypes => {
	const encryptStub = makerEncrypter();
	const addAccountRepositoryStub = makeAddAccountRepository();
	const sut = new DbAddAccount(encryptStub, addAccountRepositoryStub);
	return {
		sut,
		encryptStub,
		addAccountRepositoryStub,
	};
};

describe("DbAddAccount Usecase", () => {
	test("Should call Encrypter with correct password", async () => {
		const { sut, encryptStub } = makeSut();
		const encryptSpy = jest.spyOn(encryptStub, "encrypt");
		const accountData = {
			name: "valid_name",
			email: "valid_email",
			password: "valid_password",
		};
		await sut.add(accountData);
		expect(encryptSpy).toHaveBeenCalledWith("valid_password");
	});
	test("Should throw if Encrypter throws", async () => {
		const { sut, encryptStub } = makeSut();
		jest
			.spyOn(encryptStub, "encrypt")
			.mockReturnValueOnce(
				new Promise((resolve, reject) => reject(new Error()))
			);
		const accountData = {
			name: "valid_name",
			email: "valid_email",
			password: "valid_password",
		};
		const promise = sut.add(accountData);
		await expect(promise).rejects.toThrow();
	});
	test("Should call AddAccountRepository with correct values", async () => {
		const { sut, addAccountRepositoryStub } = makeSut();
		const addSpy = jest.spyOn(addAccountRepositoryStub, "add");
		const accountData = {
			name: "valid_name",
			email: "valid_email",
			password: "valid_password",
		};
		await sut.add(accountData);
		expect(addSpy).toHaveBeenCalledWith({
			name: "valid_name",
			email: "valid_email",
			password: "hashed_password",
		});
	});
	test("Should throw if Encrypter throws", async () => {
		const { sut, addAccountRepositoryStub } = makeSut();
		jest
			.spyOn(addAccountRepositoryStub, "add")
			.mockReturnValueOnce(
				new Promise((resolve, reject) => reject(new Error()))
			);
		const accountData = {
			name: "valid_name",
			email: "valid_email",
			password: "valid_password",
		};
		const promise = sut.add(accountData);
		await expect(promise).rejects.toThrow();
	});
	test("Should return an account on sucess", async () => {
		const { sut } = makeSut();
		const accountData = {
			name: "valid_name",
			email: "valid_email",
			password: "valid_password",
		};
		const account = await sut.add(accountData);
		expect(account).toEqual({
			id: "valid_id",
			name: "valid_name",
			email: "valid_email",
			password: "hashed_password",
		});
	});
});
