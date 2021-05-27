function vitrinaShopCart()
{
    return {
        Cart()
        {
            const cart = 
            {
                items: [],
                total: 0,
                tax: 0,
                netTotal:0,
                sendingToServer: false,
                boxCount: 0,
                invoiceType: "default",
                deliveryType: "default",
                perceptionTax: 0,
                visiblePerceptionTaxValue: 0,
                addItem(item)
                {
                    if(item === undefined || this.isDuplicate(item))
                        return false;

                    this.items.push(item);
                    return true;

                },
                removeItem(item)
                {
                    var index = this.items.findIndex(
                        (itemToDelete) =>
                        {
                            return itemToDelete.equals(item);
                        }
                    )

                    this.items.splice(index, 1);
                },
                isDuplicate(item)
                {
                    const isDuplicate = this.items.find( 
                        (existingItem) => 
                        {
                            return item.equals(existingItem);
                        } 
                    );
                    return isDuplicate !== undefined;
                },
                calculateTotal()
                {
                    var total = 0;
                    var tax = 0;
                    var perceptionTax = 0;
                    if(this.items.length > 0)
                    {
                        this.items.forEach( 
                            (item) => 
                            {
                                item.calculateTotal();
                                total += item.total;
                            }
                        );
                    }

                    this.total = total + this.visiblePerceptionTaxValue;
                },
                calculateTax()
                {
                    this.tax = 0;
                    if(this.items.length > 0)
                    {
                        this.items.forEach(
                            (item) =>
                            {
                                this.tax += item.calculateTax();
                            }
                        )
                    }
                },
                calculateNetTotal()
                {
                    this.netTotal = 0;
                    if(this.items.length > 0)
                    {
                        this.items.forEach( 
                            (item) => 
                            {
                                this.netTotal += item.calculateNetTotal();
                            }
                        );
                    }
                },
                calculateBoxCount()
                {
                    this.boxCount = 0;
                    if(this.items.length > 0)
                    {
                        this.items.forEach( 
                            (item) => 
                            {
                                this.boxCount += item.quantity;
                            }
                        );
                    }
                },
                calculatePerceptionTax()
                {
                    if(this.netTotal > 100)
                    {
                        const hundredPercent = 100;
                        this.visiblePerceptionTaxValue = this.netTotal * this.perceptionTax / hundredPercent;
                    }
                    else
                    {
                        this.visiblePerceptionTaxValue = 0;
                    }
                },
                changeInvoiceType(invoiceType)
                {
                    this.invoiceType = invoiceType;
                },
                changeDelivertyType(deliveryType)
                {
                    this.deliveryType = deliveryType;
                },
                changePerceptionTax(perceptionTax)
                {
                    this.perceptionTax = Number(perceptionTax);
                },
                isValidInvoiceType()
                {
                    return this.invoiceType !== "default";
                },
                isValidDeliveryType()
                {
                    return this.deliveryType !== "default";
                }

            }

            return cart;
        },
        Item(
            matnr,
            werks,
            lgort,
            charg,
            precio,
            currency,
            labst,
            description,
            netPrice,
            meins,
            calibre,
            marca,
            vat
        )
        {
            var emptyElements = [];
            emptyElements = !matnr ? emptyElements.concat(["matnr"]) : emptyElements;
            emptyElements = !werks ? emptyElements.concat(["werks"]) : emptyElements;
            emptyElements = !lgort ? emptyElements.concat(["lgort"]) : emptyElements;
            emptyElements = !charg ? emptyElements.concat(["charg"]) : emptyElements;
            emptyElements = !precio ? emptyElements.concat(["precio"]) : emptyElements;
            emptyElements = !currency ? emptyElements.concat(["currency"]) : emptyElements;
            emptyElements = !meins ? emptyElements.concat(["meins"]) : emptyElements;
            emptyElements = !vat ? emptyElements.concat(["iva"]) : emptyElements;

            if(emptyElements.length > 0)
            {
                var errorMessage = "Producto sin:"
                emptyElements.forEach((item) => { errorMessage += "\n" + item });
                throw new Error(errorMessage)
            }

            precio = Number(precio);
            netPrice = Number(netPrice);
            vat = Number(vat) / 100;
            const item =
            {
                matnr,
                werks,
                lgort,
                charg,
                quantity: 0,
                unitPrice: precio,
                total: 0,
                discount : 0,
                currency,
                _maxQuantity: labst,
                description,
                netPrice,
                tax: 0,
                displayPrice: precio,
                discountOperator: "-",
                quantityUnit: meins,
                calibre,
                marca,
                vat: vat,
                changeQuantity(quantity)
                {
                    if(Number(quantity) < 1 || Number(quantity) > Number(this._maxQuantity))
                    {
                        this.quantity = 0;
                        throw new Error(`Minimo 1 maximo ${this._maxQuantity}`);
                    }

                    this.quantity = Number(quantity);
                },
                changeDiscount(discount)
                {   
                    this.discount = Number(discount);
                },
                calculateTotal()
                {
                    if(this.discount !== 0)
                    {
                        var discount = this.discount;
                        if(this.discountOperator === "-")
                            discount = discount * -1;
                        
                        const total = this.unitPrice + discount;
                        this.total = this.quantity * total;
                    }
                    else
                    {
                        this.total = this.quantity * this.unitPrice;
                    }

                    return this.total;
                },
                calculateNetTotal()
                {
                    var total = 0;
                    const actualNetPrice = this.unitPrice / (this.currentTaxRate() + 1);
                    if(this.discount !== 0)
                    {
                        var discount = this.discount;
                        if(this.discountOperator === "-")
                            discount = discount * -1;
                        
                        total = actualNetPrice + (discount / (this.currentTaxRate() + 1));
                        total = this.quantity * total;
                    }
                    else
                    {
                        total = this.quantity * actualNetPrice;
                    }

                    return total;
                },
                validate()
                {
                    const validator = 
                    {
                        isValidQuantity: true,
                        isValidDiscount: true
                    }

                    if(this.quantity === 0 || 
                    this.quantity < 0 || 
                    this.quantity > this._maxQuantity)
                    {
                        validator.isValidQuantity = false;
                    }

                    if(this.discount < 0)
                    {
                        validator.isValidDiscount = false;
                    }

                    return validator;
                },
                equals(item)
                {
                    return this.matnr === item.matnr &&
                    this.werks === item.werks &&
                    this.lgort === item.lgort &&
                    this.charg === item.charg &&
                    this.unitPrice === item.unitPrice &&
                    this.currency === item.currency &&
                    this._maxQuantity === item._maxQuantity;
                },
                calculateTax()
                {            
                    return this.calculateTotal() - ( this.calculateTotal() / (1 + this.vat) );
                },
                changeDisplayPrice()
                {
                    var discount = this.discount;
                    if(this.discountOperator === "-")
                        discount = discount * -1;
                        
                    this.displayPrice = this.unitPrice + discount;
                },
                changeDiscountOperator(operator)
                {
                    if(operator !== "-" && operator !== "+")
                    {
                        throw new Error("Operador invalido");
                    }

                    this.discountOperator = operator;
                },
                updateStock(stock)
                {
                    if(!stock)
                        throw new Error("Invalid stock");
                    
                    this._maxQuantity = Number(stock);
                },
                currentTaxRate()
                {
                    return this.vat;
                }
            };

            return item;
}
    }
}