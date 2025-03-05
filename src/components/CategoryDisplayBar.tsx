const CategoryDisplayBar = ({categories} : {categories: string[]}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-2">
      {categories.map((category, idx) => (
        <span
          key={idx}
          className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium"
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
      ))}
    </div>
  );
};

export default CategoryDisplayBar;
