import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Squircle, ArrowLeft, House } from 'lucide-react';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  
  let errorMessage = "An unexpected error has occurred.";
  let errorStatus = "Error";
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      errorStatus = "404 - Not Found";
      errorMessage = "Sorry, the page you are looking for doesn't exist.";
    } else {
      errorStatus = `${error.status} - ${error.statusText}`;
      errorMessage = error.data?.message || errorMessage;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-lg w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <Squircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{errorStatus}</h1>
        <p className="text-gray-600 mb-8">{errorMessage}</p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700 transition-colors duration-150"
          >
            <House className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
