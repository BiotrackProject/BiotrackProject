export default function Checkbox({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-grey accent-action cursor-pointer"
      />
      <span className="text-sm text-dark">{label}</span>
    </label>
  )
}
