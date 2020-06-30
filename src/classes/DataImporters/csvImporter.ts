import childProcess from "child_process";

 const mongoImport2 = (options: string ) =>{  
   console.log( options)
  console.log({options: options.split(/\s+/)})
  return childProcess.spawn(
    `mongoimport`,
    options.split(/\s+/)
  );
}
export default mongoImport2