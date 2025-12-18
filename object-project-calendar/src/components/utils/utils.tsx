export const formatDate = (date:Date) => {
  const day = String(date.getDate());
  const month = String(date.getMonth() + 1); // i mesi partono da 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// .padStart(2, '0') aggiunge gli zeri 

