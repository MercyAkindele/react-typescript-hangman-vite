import { useEffect, useState, useCallback } from "react";
import HangmanDrawing from "./components/HangmanDrawing";
import HangmanWord from "./components/HangmanWord";
import Keyboard from "./components/Keyboard";

const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;

type MyHeadersInit= HeadersInit & {
  "X-RapidAPI-Key": string,
  "X-RapidAPI-Host": string,
}

function App() {
  const [wordToGuess, setWordToGuess] = useState(" ");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const incorrectLetters = guessedLetters.filter(
    (letter) => !wordToGuess.includes(letter)
  );
  const isLoser = incorrectLetters.length >= 6;

  const isWinner = wordToGuess
    .split("")
    .every((letter) => guessedLetters.includes(letter));

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return;
      setGuessedLetters((currentLetters) => [...currentLetters, letter]);
    },
    [guessedLetters, isLoser, isWinner]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (!key.match(/^[a-z-]$/)) return;
      e.preventDefault();
      addGuessedLetter(key);
    };
    document.addEventListener("keypress", handler);
    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, [guessedLetters]);

  useEffect(() => {
    const fetchWord = async () => {
      const url = "https://wordsapiv1.p.rapidapi.com/words/?random=true";
      const options: RequestInit = {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey as string,
          "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
        } as MyHeadersInit  ,
      };
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        const word = data.word.split(" ")[0];
        setWordToGuess(word);
      } catch (error) {
        console.error("Error fetching word: ", error);
      }
    };

    fetchWord();
  }, []);

  return (
    <div
      style={{
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        margin: "0 auto",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          textAlign: "center",
        }}
      >
        {isWinner && "Winner! Refresh to try another word!"}
        {isLoser && "Nice try! Refresh page to try a different word!"}
      </div>
      <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
      <HangmanWord
        reveal={isLoser}
        guessedLetters={guessedLetters}
        wordToGuess={wordToGuess}
      />
      <div
        style={{
          alignSelf: "stretch",
        }}
      >
        <Keyboard
          disabled={isWinner || isLoser}
          activeLetters={guessedLetters.filter((letter) =>
            wordToGuess.includes(letter)
          )}
          inactiveLetters={incorrectLetters}
          addGuessedLetter={addGuessedLetter}
        />
      </div>
    </div>
  );
}

export default App;
