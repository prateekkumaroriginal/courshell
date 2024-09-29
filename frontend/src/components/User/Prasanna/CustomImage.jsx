const CustomImage = ({
  customSrc,
  customHeight,
  customWidth,
  customClass,
  customAlt,
}) => {
  if (!customSrc) return <></>;

  return (
    <img
      src={customSrc || "./photos/image2.jpg"}
      height={customHeight || ""}
      width={customWidth || ""}
      className={customClass || ""}
      alt={customAlt || ""}
    />
  );
};

export default CustomImage;
