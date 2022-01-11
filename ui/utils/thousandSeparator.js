const thousandSeparator = (x) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export default thousandSeparator;
