import { useTheme } from "../../context/ThemeContext.jsx";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'Cupcake', value: 'cupcake' },
    { name: 'Bumblebee', value: 'bumblebee' },
    { name: 'Emerald', value: 'emerald' },
    { name: 'Corporate', value: 'corporate' },
    { name: 'Synthwave', value: 'synthwave' },
    { name: 'Retro', value: 'retro' },
    { name: 'Cyberpunk', value: 'cyberpunk' },
    { name: 'Valentine', value: 'valentine' },
    { name: 'Halloween', value: 'halloween' },
    { name: 'Garden', value: 'garden' },
    { name: 'Forest', value: 'forest' },
    { name: 'Aqua', value: 'aqua' },
    { name: 'Lofi', value: 'lofi' },
    { name: 'Pastel', value: 'pastel' },
    { name: 'Fantasy', value: 'fantasy' },
    { name: 'Wireframe', value: 'wireframe' },
    { name: 'Black', value: 'black' },
    { name: 'Luxury', value: 'luxury' },
    { name: 'Dracula', value: 'dracula' },
    { name: 'CMYK', value: 'cmyk' },
    { name: 'Autumn', value: 'autumn' },
    { name: 'Business', value: 'business' },
    { name: 'Acid', value: 'acid' },
    { name: 'Lemonade', value: 'lemonade' },
    { name: 'Night', value: 'night' },
    { name: 'Coffee', value: 'coffee' },
    { name: 'Winter', value: 'winter' },
    { name: 'Dim', value: 'dim' },
    { name: 'Nord', value: 'nord' },
    { name: 'Sunset', value: 'sunset' }
  ];

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow max-h-64 overflow-y-auto">
        {themeOptions.map((themeOption) => (
          <li key={themeOption.value}>
            <a
              className={theme === themeOption.value ? 'bg-primary text-primary-content' : ''}
              onClick={() => setTheme(themeOption.value)}
            >
              {themeOption.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}