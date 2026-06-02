insert into settings (key, value, description)
values (
  'qr_destination',
  '/emergency',
  'Where the printed QR code redirects to. Can be a relative path (/emergency) or a full URL.'
)
on conflict (key) do nothing;
