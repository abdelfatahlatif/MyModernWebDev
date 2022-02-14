import BlogList from "./BlogList";
import useFetch from "./useFetch";

const Homepage = () => {
  const { data, isLoading, error } = useFetch("http://localhost:8000/blogs");

//   const handleClick = (arg) => {
//     alert(arg);
//   };

//   const handleDelete = (id) => {
//     const newBlogs = data.filter((blog) => blog.id !== id);
//     // setBlogs(newBlogs);
//   };

  return (
    <div className="home">
      {error && <div> {error} </div>}
      {isLoading && <div> loading .... </div>}     
      {data && <BlogList blogs={data}></BlogList>}
      {/*handleDelete={handleDelete} <button onClick={() => handleClick("hello ya bashar")}>Click Me 2</button>*/}
    </div>
  );
};
export default Homepage;
