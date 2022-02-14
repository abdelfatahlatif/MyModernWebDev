import { useState } from "react/cjs/react.development";
import { useHistory } from "react-router-dom";

const Create = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    const blog = { title, body, author };
    setIsLoading(true);
    fetch("http://localhost:8000/blogs/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    })
      .then((res) => {
        if (res.ok) {
          setIsLoading(false);
          history.push('/');
        }
      })
      .catch((err) => {
        setIsLoading(false);
        alert(err.message);
      });
  };
  return (
    <div className="create">
      <h2>Create a new Blog</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="">Blog Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="">Blog Body</label>
        <textarea
          cols="30"
          rows="10"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
        ></textarea>
        <label htmlFor="">Blog Author</label>
        <select
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        >
          <option value=""></option>
          <option value="mario">mario</option>
          <option value="abdo">abdo</option>
        </select>
        {!isLoading && <button>Add Blog</button>}
      </form>
    </div>
  );
};

export default Create;
