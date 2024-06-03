class RawTokenAmount {
    tokenAmount: string;
    decimals: number;

    constructor(tokenAmount: string, decimals: number) {
        this.tokenAmount = tokenAmount;
        this.decimals = decimals;
    }

    static fromJSON(json: any): RawTokenAmount {
        return new RawTokenAmount(json.tokenAmount || '', json.decimals || 0);
    }
}

class TokenBalanceChange {
    userAccount: string;
    tokenAccount: string;
    rawTokenAmount: RawTokenAmount;
    mint: string;

    constructor(userAccount: string, tokenAccount: string, rawTokenAmount: RawTokenAmount, mint: string) {
        this.userAccount = userAccount;
        this.tokenAccount = tokenAccount;
        this.rawTokenAmount = rawTokenAmount;
        this.mint = mint;
    }

    static fromJSON(json: any): TokenBalanceChange {
        return new TokenBalanceChange(
            json.userAccount || '',
            json.tokenAccount || '',
            RawTokenAmount.fromJSON(json.rawTokenAmount || {}),
            json.mint || ''
        );
    }
}

class AccountData {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: TokenBalanceChange[];

    constructor(account: string, nativeBalanceChange: number, tokenBalanceChanges: TokenBalanceChange[]) {
        this.account = account;
        this.nativeBalanceChange = nativeBalanceChange;
        this.tokenBalanceChanges = tokenBalanceChanges;
    }

    static fromJSON(json: any): AccountData {
        return new AccountData(
            json.account || '',
            json.nativeBalanceChange || 0,
            (json.tokenBalanceChanges || []).map((tbc: any) => TokenBalanceChange.fromJSON(tbc))
        );
    }
}

class NativeTransfer {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;

    constructor(fromUserAccount: string, toUserAccount: string, amount: number) {
        this.fromUserAccount = fromUserAccount;
        this.toUserAccount = toUserAccount;
        this.amount = amount;
    }

    static fromJSON(json: any): NativeTransfer {
        return new NativeTransfer(json.fromUserAccount || '', json.toUserAccount || '', json.amount || 0);
    }
}

class TokenTransfer {
    fromTokenAccount: string;
    toTokenAccount: string;
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: string;

    constructor(fromTokenAccount: string, toTokenAccount: string, fromUserAccount: string, toUserAccount: string, tokenAmount: number, mint: string, tokenStandard: string) {
        this.fromTokenAccount = fromTokenAccount;
        this.toTokenAccount = toTokenAccount;
        this.fromUserAccount = fromUserAccount;
        this.toUserAccount = toUserAccount;
        this.tokenAmount = tokenAmount;
        this.mint = mint;
        this.tokenStandard = tokenStandard;
    }

    static fromJSON(json: any): TokenTransfer {
        return new TokenTransfer(
            json.fromTokenAccount || '',
            json.toTokenAccount || '',
            json.fromUserAccount || '',
            json.toUserAccount || '',
            json.tokenAmount || 0,
            json.mint || '',
            json.tokenStandard || ''
        );
    }
}

class Instruction {
    accounts: string[];
    data: string;
    programId: string;
    innerInstructions: Instruction[];

    constructor(accounts: string[], data: string, programId: string, innerInstructions: Instruction[]) {
        this.accounts = accounts;
        this.data = data;
        this.programId = programId;
        this.innerInstructions = innerInstructions;
    }

    static fromJSON(json: any): Instruction {
        return new Instruction(
            json.accounts || [],
            json.data || '',
            json.programId || '',
            (json.innerInstructions || []).map((ii: any) => Instruction.fromJSON(ii))
        );
    }
}

class Transaction {
    description: string;
    type: string;
    source: string;
    fee: number;
    feePayer: string;
    signature: string;
    slot: number;
    timestamp: number;
    tokenTransfers: TokenTransfer[];
    nativeTransfers: NativeTransfer[];
    accountData: AccountData[];
    transactionError: any;
    instructions: Instruction[];

    constructor(
        description: string,
        type: string,
        source: string,
        fee: number,
        feePayer: string,
        signature: string,
        slot: number,
        timestamp: number,
        tokenTransfers: TokenTransfer[],
        nativeTransfers: NativeTransfer[],
        accountData: AccountData[],
        transactionError: any,
        instructions: Instruction[]
    ) {
        this.description = description;
        this.type = type;
        this.source = source;
        this.fee = fee;
        this.feePayer = feePayer;
        this.signature = signature;
        this.slot = slot;
        this.timestamp = timestamp;
        this.tokenTransfers = tokenTransfers;
        this.nativeTransfers = nativeTransfers;
        this.accountData = accountData;
        this.transactionError = transactionError;
        this.instructions = instructions;
    }

    static fromJSON(json: any): Transaction {
        return new Transaction(
            json.description || '',
            json.type || '',
            json.source || '',
            json.fee || 0,
            json.feePayer || '',
            json.signature || '',
            json.slot || 0,
            json.timestamp || 0,
            (json.tokenTransfers || []).map((tt: any) => TokenTransfer.fromJSON(tt)),
            (json.nativeTransfers || []).map((nt: any) => NativeTransfer.fromJSON(nt)),
            (json.accountData || []).map((ad: any) => AccountData.fromJSON(ad)),
            json.transactionError || null,
            (json.instructions || []).map((i: any) => Instruction.fromJSON(i))
        );
    }

    static fromJSONArray(jsonArray: any[]): Transaction[] {
        return jsonArray.map(json => Transaction.fromJSON(json));
    }
}


export {Transaction, RawTokenAmount, TokenBalanceChange, AccountData, NativeTransfer, TokenTransfer, Instruction}