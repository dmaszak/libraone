// Card Component

const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  hover = false,
  onClick
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${paddings[padding]} ${
        hover ? 'hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
