//Convertendo a duração recebida como Number em String.

export function convertDurationToTimeString(duration: number){
  const hours = Math.floor(duration /  3600 ); // 3600 = (60 * 60)
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  //Formatando a String para estilo relógio
  const timeString = [hours, minutes, seconds]
    //Colocando 0 na frente de qualquer número único ex: 1 = 01 com .padStart
    .map(unit => String(unit).padStart(2, '0')) 
    .join(':')

  return timeString;
}