export function refName(value: unknown, fallback = "—") {
  if (!value) return fallback;
  if (typeof value === "string") return fallback;
  if (typeof value === "object" && "name" in value) {
    const name = (value as { name?: string }).name;
    if (name) return name;
  }
  if (typeof value === "object" && "title" in value) {
    const title = (value as { title?: string }).title;
    if (title) return title;
  }
  return fallback;
}

export function refId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id: string })._id);
  }
  return "";
}

export function apiErrorMessage(err: unknown, fallback = "Request failed") {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return fallback;
}
