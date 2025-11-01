// Let ethers be available in the window scope
declare const ethers: any;

// --- Contract Details ---
// This is a placeholder address. You would replace this with your deployed contract address.
const CONTRACT_ADDRESS = "0x4014A49_YOUR_DEPLOYED_CONTRACT_ADDRESS"; // IMPORTANT: Replace with your actual address

const CONTRACT_ABI = [
  "event GameCreated(uint256 indexed gameId, address indexed player, uint8 difficulty)",
  "event MoveMade(uint256 indexed gameId, address indexed player, uint8 position, uint8 aiPosition)",
  "event GameFinished(uint256 indexed gameId, uint8 result)",
  "error GameAlreadyOver()",
  "error InvalidMove()",
  "error NoActiveGame()",
  "error NotYourTurn()",
  "function activeGameIdOf(address) view returns (uint256)",
  "function createGame(uint8 _difficulty) returns (uint256)",
  "function games(uint256) view returns (tuple(uint8[9] board, address player, uint8 status, uint8 difficulty, uint8 moveCount))",
  "function getGame(uint256 _gameId) view returns (tuple(uint8[9] board, address player, uint8 status, uint8 difficulty, uint8 moveCount))",
  "function nextGameId() view returns (uint256)",
  "function playerMove(uint256 _gameId, uint8 _position)"
];

// --- Type Definitions ---
export interface GameState {
    board: number[];
    player: string;
    status: number; // Enum: 0: InProgress, 1: PlayerWon, 2: AIWon, 3: Draw
    difficulty: number; // Enum: 0: Easy, 1: Medium, 2: Hard
    moveCount: number;
}
export interface GameEvent {
  id: string;
  result: 'win' | 'loss' | 'draw';
  transactionHash: string;
}

// --- Helper Mappers ---
const getContract = (signer: any) => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const mapBoard = (onChainBoard: number[]): ('X' | 'O' | null)[] => {
    return onChainBoard.map(cell => {
        if (cell === 1) return 'X'; // PlayerX
        if (cell === 2) return 'O'; // AiO
        return null; // Empty
    });
};

export const mapGameStatus = (status: number): 'inProgress' | 'win' | 'loss' | 'draw' => {
    switch(status) {
        case 1: return 'win';
        case 2: return 'loss';
        case 3: return 'draw';
        default: return 'inProgress';
    }
};

// --- Service Functions ---

const createGame = async (signer: any, difficulty: 'easy' | 'medium' | 'hard'): Promise<number> => {
    const contract = getContract(signer);
    const difficultyEnum = { easy: 0, medium: 1, hard: 2 };
    
    const tx = await contract.createGame(difficultyEnum[difficulty]);
    
    // Wait for the transaction to be mined and get the receipt
    const receipt = await tx.wait();
    
    // Find the GameCreated event in the logs
    const event = receipt.events?.find((e: any) => e.event === 'GameCreated');
    if (event && event.args) {
        // The gameId is an argument of the event
        return event.args.gameId.toNumber();
    }
    
    throw new Error("Could not find GameCreated event in transaction receipt.");
};


const playerMove = async (signer: any, gameId: number, position: number): Promise<void> => {
    const contract = getContract(signer);
    const tx = await contract.playerMove(gameId, position);
    await tx.wait(); // Wait for the transaction to be mined
};

const getGame = async (signer: any, gameId: number): Promise<GameState> => {
    const contract = getContract(signer);
    const result = await contract.getGame(gameId);
    // Convert BigNumber properties to numbers for easier use in JS
    return {
        board: result.board.map((c: any) => Number(c)),
        player: result.player,
        status: Number(result.status),
        difficulty: Number(result.difficulty),
        moveCount: Number(result.moveCount)
    };
};


const getActiveGameId = async (signer: any, playerAddress: string): Promise<number> => {
    const contract = getContract(signer);
    const gameIdBigNumber = await contract.activeGameIdOf(playerAddress);
    return gameIdBigNumber.toNumber();
};

const getNextGameId = async (signer: any): Promise<number> => {
    const contract = getContract(signer);
    const nextId = await contract.nextGameId();
    return nextId.toNumber();
}

const getGameHistory = async (signer: any, playerAddress: string): Promise<GameEvent[]> => {
    const contract = getContract(signer);
    const filter = contract.filters.GameFinished(null, null);
    
    // This can be slow on public networks. For a real app, an indexing service (like The Graph) is better.
    const events = await contract.queryFilter(filter);
    
    const playerHistory: GameEvent[] = [];

    for (const event of events) {
        if(event.args) {
            const gameId = event.args.gameId.toNumber();
            // We need to check who the player was for this game
            const gameDetails = await getGame(signer, gameId);

            if (gameDetails.player.toLowerCase() === playerAddress.toLowerCase()) {
                const resultEnum = event.args.result; // 1: PlayerWon, 2: AIWon, 3: Draw
                let result: 'win' | 'loss' | 'draw';
                 switch(resultEnum) {
                    case 1: result = 'win'; break;
                    case 2: result = 'loss'; break;
                    case 3: result = 'draw'; break;
                    default: continue; // Skip unknown result types
                }
                playerHistory.push({
                    id: `${gameId}-${event.transactionHash}`,
                    result,
                    transactionHash: event.transactionHash
                });
            }
        }
    }
    // Return newest first
    return playerHistory.reverse();
};


export const contractService = {
    createGame,
    playerMove,
    getGame,
    getActiveGameId,
    getNextGameId,
    getGameHistory,
};
