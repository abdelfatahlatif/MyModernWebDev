import { Link } from "react-router-dom";

const BlogList = ({ blogs, handleDelete }) => {
  return (
    <div className="blog-list">
      {blogs.map((blog) => (
        <div className="blog-preview" key={blog.id}>
          <Link to={`/blogs/${blog.id}`}>
            <h2>{blog.title}</h2>
          </Link>
          <p>written by {blog.author}</p>
          {/*<button onClick={() => handleDelete(blog.id)}>Delete</button>*/}
        </div>
      ))}
    </div>
  );
};

export default BlogList;
