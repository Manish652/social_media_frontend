import { useNavigate } from "react-router-dom";
import CreateStoryModal from "../components/story/CreateStoryModal.jsx";

export default function CreateStory() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  const handleSuccess = () => {
    navigate("/");
  };

  return (
    <div className="lg:ml-64 xl:mr-80">
      <CreateStoryModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
