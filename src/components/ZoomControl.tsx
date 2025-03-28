
export const ZoomControls = () => {

  return (
    <div className="fixed bottom-4 left-4 bg-white p-2 rounded-md shadow-lg flex items-center gap-3 z-30">
      <button

        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"

      >
        -
      </button>
      <span className="text-sm w-12 text-center">

      </span>
      <button

        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"

      >
        +
      </button>
      <button

        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
      >
        Reset
      </button>
    </div>
  );
};