export default function ImageMarque() {

    const images = [
        "https://static.wixstatic.com/media/fe487d_0b01c77dff29402f8cf07fe7bccc6292~mv2.png/v1/fill/w_608,h_310,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/fe487d_0b01c77dff29402f8cf07fe7bccc6292~mv2.png",
    ];

    const promotText = [
        "👀 Want top deals? Get our Black Friday app 👉",
    ];

    const repeatCount = 12;
    const repeatCountText = 5;
    const repeatedImages = Array.from({ length: repeatCount }, (_, index) => (
        <img 
            key={index}
            className="h-[200px]"
            src={images[0]} 
            alt={`marque-image-${index + 1}`}
            loading="lazy"
        />
    ));

    const repeatedText = Array.from({ length: repeatCountText }, (_, index) => (
        <p key={index} className="product-title">{promotText[0]}</p>
    ));

    return (
        <div className="w-full flex flex-col justify-center">
            <div className="w-full" style={{ overflow: "hidden" }}>
                <div className="flex justify-center image-marque w-full">
                    {repeatedImages}
                </div>            
            </div>
            <div className="w-full" style={{ "overflow": "hidden", "background":"#FFBB00" }}>
                <div className="flex text-marque gap-4 whitespace-nowrap">
                    {repeatedText}
                </div>
            </div>              
        </div>
    );
}