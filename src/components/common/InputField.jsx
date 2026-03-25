export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  ...props
}) {
  return (
    <div className="form-control mb-4">
      <label className="label">
        <span className="label-text font-semibold">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={type === "file" ? undefined : value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input input-bordered focus:input-primary"
        {...props}
      />
    </div>
  );
}
