const Container = ({ icon, title, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-48 h-48 bg-white rounded-xl flex flex-col items-center justify-center 
                 cursor-pointer shadow-md hover:shadow-xl hover:scale-105 transition transform group"
    >
      <div className="text-5xl group-hover:text-blue-600">{icon}</div>
      <div className="mt-4 font-semibold group-hover:text-blue-600">{title}</div>
    </div>
  );
};

export default Container;
