import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CollectionRedirect = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    if (slug) {
      navigate(`/shop?category=${encodeURIComponent(slug)}`);
    } else {
      navigate("/shop");
    }
  }, [slug, navigate]);

  return null;
};

export default CollectionRedirect;
