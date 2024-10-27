'use client'
import { useState } from "react";

interface Todo {
    text: string;
    key: number;
}

export default function Skuska() {
    const [todo, setTodo] = useState<Todo[]>([]);
    const [text, setText] = useState("");
    const [lastKey, setLastKey] = useState<number>(0);
    const [random, setRandom] = useState<any>()

    const addTodo = ({ text, key }: { text: string; key: number }) => {
        setTodo([...todo, { text, key }]);
        setLastKey(key); // Update lastKey so that the key keeps incrementing
        setText(''); // Clear the input field after adding a todo

    };

    const removeTodo = (key: number) => {
        const updatedTodos = todo.filter((todo) => todo.key !== key);
        setTodo(updatedTodos);
    };

    async function fetcher ()  {
        try {
            const values = await fetch('https://random-data-api.com/api/v2/users?size=2&is_json=true',{method: "GET"})
            const data = await values.json()
            setRandom(data)
        } catch (error) {
            throw Error
        }
    }


    return (
        <>
            <input value={text} onChange={(e) => setText(e.target.value)}></input>
            <button onClick={() => addTodo({text: text, key: lastKey + 1})}>Add</button>
            <ul>
                {todo.map((todo) => (
                    <li key={todo.key}>
                        {todo.text}
                        <button onClick={() => removeTodo(todo.key)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button onClick={fetcher}>Fetch Data</button>
            {/* Button to trigger fetch */}
            {random &&  <div>{JSON.stringify(random[0].id)}</div>} {/* Display fetched data */}
        </>
    );
}
