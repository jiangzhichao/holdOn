export default function loadAuth(req) {
  return Promise.resolve({user: req.session.user} || null);
}
