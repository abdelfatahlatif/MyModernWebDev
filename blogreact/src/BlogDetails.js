import { useHistory, useParams } from "react-router-dom";
import useFetch from "./useFetch";

const BlogDetails = () => {
  const { id } = useParams();
  const history = useHistory();
  const {
    data: blog,
    isLoading,
    Error,
  } = useFetch(`http://localhost:8000/blogs/${id}`);
  
  const handlClick = () => {
    fetch("http://localhost:8000/blogs/" + blog.id, {
        method: "DELETE"
      })
        .then((res) => {
          if (res.ok) {
            //setIsLoading(false);
            history.push('/');
          }
        })
        .catch((err) => {
         // setIsLoading(false);
          alert(err.message);
        });
  };
  return (
    <div className="blog-details">
      {isLoading && <div className=""> Loading......</div>}
      {Error && <div className=""> {Error}</div>}
      {blog && (
        <article>
          <h2>{blog.title}</h2>
          <p>written by {blog.author}</p>
          <div>{blog.body}</div>
          <button onClick={handlClick}>delete</button>
        </article>
      )}
    </div>
  );
};

export default BlogDetails;
