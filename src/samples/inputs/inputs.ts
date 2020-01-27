require('./index.html'); // webpack dependency
import { template } from "../../iv";
import { value } from "../../iv/inputs";

const main = template(`($, text:string="hello", option:boolean=true, color:string = "Green", quantity:number=42) => {
    <h3> # Text fields # </h3>
    <div>
        # Some text (change only): # <input type="text" size=40 @value(data={=$.text} events="change")/>
    </>
    <div>
        # Some text (change+input+100ms debounce): # <input type="text" size=40 @value(data={=$.text} events="input" debounce=100)/>
    </>
    <div>
        # Some text (change+input+500ms debounce): # <input type="text" size=40 @value(data={=$.text} events="input" debounce=500)/>
    </>
    <div>
        # Some text (change+input+no debounce): # <input type="text" size=40 @value={=$.text}/>
    </>
    <div>
        # You typed: {$.text} # 
    </>
    <h3> # Checkboxes # </h3>
    <div>
        <label> # Option: # <input type="checkbox" @value={=$.option}/> # \(no debounce - default) # </label>
    </>
    <div>
        <label> # Option: # <input type="checkbox" @value(data={=$.option} debounce=500)/> # \(debounce=500) # </label>
    </>
    <div>
        # You selected: {$.option} # 
    </>
    <h3> # Radio buttons # </h3>
    <div>
        # Set selection (color1): # 
        for (let option of ["Red", "Green", "Blue"]) {
            <label> <input type="radio" name="color1" value={option} @value={=$.color}/> # {option} # </>
        }
    </>
    <div>
        # Set selection (color2): # 
        for (let option of ["Red", "Green", "Blue"]) {
            <label> <input type="radio" name="color2" value={option} @value(data={=$.color} debounce=500)/> # {option} # </>
        }
        # -> debounce=500 #
    </>
    <div>
        # You selected: {$.color} # 
    </>
    <h3> # Number fields # </h3>
    <div>
        # Quantity (change only): # <input type="number" size=5 @value(data={=$.quantity} events="change")/>
    </>
    <div>
        # Quantity (change+input+200ms debounce): # <input type="number" size=5 @value(data={=$.quantity} events="input" debounce=200)/>
    </>
    <div>
        # Quantity (change+input+no debounce): # <input type="number" size=5 @value={=$.quantity}/>
    </>
    <div>
        # Selected quantity: {$.quantity} # 
    </>
}`, value);


main()
    .attach(document.getElementById("main"))
    .render();
