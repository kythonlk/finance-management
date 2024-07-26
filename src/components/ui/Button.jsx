import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ 
  type = 'button', 
  onClick, 
  className = '', 
  children, 
  disabled = false, 
  loading = false, 
  variant = 'primary' 
}) => {
  const baseClasses = 'py-2 px-4 border rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white border-transparent hover:bg-red-700 focus:ring-red-500',
    // Add more variants as needed
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M12 2v2M12 22v-2m8.66-13.66l-1.42 1.42M5.66 18.66l-1.42-1.42m14.42 6.36l-1.42-1.42M4.66 4.66l-1.42 1.42M22 12h-2M4 12H2m17.66 8.66l-1.42-1.42M6.66 6.66L5.24 5.24" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
};

export default Button;
